import MdEditor from "md-editor-rt";
import sanitizeHtml from "sanitize-html";
import "md-editor-rt/lib/style.css";
import type {
  EditorProp as MdEditorProps,
  ToolbarNames,
} from "md-editor-rt/lib/MdEditor/type";
import { cleanStr } from "../utils/clean-str";

const sanitizer = (html: string) => sanitizeHtml(html);

const toolbars: ToolbarNames[] = [
  "bold",
  "underline",
  "italic",
  "-",
  "revoke",
  "next",
  "=",
  "preview",
  "pageFullscreen",
];

type EditorProps = Partial<MdEditorProps> & {
  value: string;
  onChange: (text: string) => void;
};

export const Editor = ({ value, onChange, ...props }: EditorProps) => {
  return (
    <>
      <MdEditor
        preview={false}
        editorId="md-editor"
        language="en-US"
        toolbars={toolbars}
        sanitize={sanitizer}
        formatCopiedText={cleanStr}
        noUploadImg
        theme="dark"
        {...props}
        onChange={onChange}
        modelValue={value}
      />
    </>
  );
};
