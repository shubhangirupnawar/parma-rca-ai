import io
import logging
from typing import Tuple
from pypdf import PdfReader

logger = logging.getLogger("pharma_rca.pdf_service")

def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool, str]:
    """
    Extracts text from PDF byte content.
    Returns: (extracted_text, ocr_required, message)
    """
    if not file_bytes:
        return "", False, "File is empty."

    try:
        pdf_stream = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_stream)
        
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                return "", False, "PDF is password protected and cannot be extracted."

        total_pages = len(reader.pages)
        if total_pages == 0:
            return "", False, "PDF document contains no pages."

        extracted_text_chunks = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            if page_text.strip():
                extracted_text_chunks.append(f"--- Page {i + 1} ---\n{page_text.strip()}")

        full_text = "\n\n".join(extracted_text_chunks).strip()
        
        # Check if text is usable or if the PDF is a scanned image
        # If there are pages but almost zero alphanumeric text extracted
        alphanumeric_count = sum(c.isalnum() for c in full_text)
        
        if total_pages > 0 and alphanumeric_count < 30:
            logger.warning(f"PDF has {total_pages} pages but only {alphanumeric_count} alphanumeric chars. Scanned document detected.")
            return "", True, (
                f"OCR is required: No extractable text found in this PDF document ({total_pages} page(s)). "
                "The document appears to be scanned or image-based. Please run OCR or paste the text content directly."
            )

        logger.info(f"Successfully extracted {len(full_text)} characters from {total_pages} pages.")
        return full_text, False, f"Successfully extracted text from {total_pages} page(s)."

    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}", exc_info=True)
        return "", False, f"Failed to parse PDF document: {str(e)}"
