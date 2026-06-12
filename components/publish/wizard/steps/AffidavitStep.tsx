import React, { type RefObject } from "react";
import { CloudUpload } from "@carbon/icons-react";
import { FileUploaderDropContainer, InlineNotification } from "@carbon/react";
import { AffidavitPreview } from "@/components/publish/AffidavitPreview";
import { AffidavitVerificationChecklist } from "@/components/publish/wizard/ui/AffidavitVerificationChecklist";
import { FieldError } from "@/components/publish/wizard/ui/FieldError";
import { AFFIDAVIT_ACCEPTED_TYPES } from "@/lib/publish";

interface AffidavitStepProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  documentFile: File | null;
  previewUrl: string | null;
  uploadingAffidavit: boolean;
  hasAffidavit: boolean;
  documentError?: string;
  onFileAdd: (_: unknown, payload: { addedFiles: File[] }) => void;
  onRemoveDocument: () => void;
  onReplaceDocument: () => void;
}

export function AffidavitStep({
  fileInputRef,
  documentFile,
  previewUrl,
  uploadingAffidavit,
  hasAffidavit,
  documentError,
  onFileAdd,
  onRemoveDocument,
  onReplaceDocument,
}: AffidavitStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-ink)]">
          Court affidavit
        </h2>
        <p className="mt-1 text-sm text-[var(--color-ink-muted)] tracking-[0.16px]">
          Upload a clear photo of your sworn Change of Name affidavit. It will be verified before you
          can continue.
        </p>
      </div>

      <div className="lg:hidden">
        <AffidavitVerificationChecklist compact />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={AFFIDAVIT_ACCEPTED_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileAdd(null, { addedFiles: [file] });
          e.target.value = "";
        }}
      />

      {!documentFile && (
        <FileUploaderDropContainer
          accept={AFFIDAVIT_ACCEPTED_TYPES as unknown as string[]}
          className="publish-wizard__affidavit-upload"
          labelText={
            (
              <span className="publish-wizard__affidavit-upload-label">
                <CloudUpload size={32} aria-hidden className="publish-wizard__affidavit-upload-icon" />
                <span>Drag and drop your affidavit image here, or click to upload</span>
              </span>
            ) as unknown as string
          }
          multiple={false}
          onAddFiles={onFileAdd}
        />
      )}

      {documentFile && previewUrl && (
        <div className="lg:hidden">
          <AffidavitPreview
            file={documentFile}
            previewUrl={previewUrl}
            uploading={uploadingAffidavit}
            uploaded={hasAffidavit}
            onRemove={onRemoveDocument}
            onReplace={onReplaceDocument}
          />
        </div>
      )}

      {hasAffidavit && !documentFile && (
        <InlineNotification
          kind="success"
          lowContrast
          hideCloseButton
          title="Affidavit on file"
          subtitle="Your affidavit is already uploaded. Upload a new image to replace it."
        />
      )}

      <FieldError message={documentError} />
    </div>
  );
}