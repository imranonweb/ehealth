import { PdfViewerModal } from '../common/PdfViewerModal';

export function DocumentViewer({ isOpen, onClose, documentPath, filePath, title = 'Medical Document' }) {
  return (
    <PdfViewerModal
      isOpen={isOpen}
      onClose={onClose}
      filePath={filePath || documentPath}
      title={title}
    />
  );
}
