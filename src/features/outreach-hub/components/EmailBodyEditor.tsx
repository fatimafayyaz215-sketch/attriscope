"use client";

import { forwardRef, useEffect, useImperativeHandle } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export type EmailBodyEditorHandle = {
  setContent: (html: string) => void;
  getContent: () => string;
  isEmpty: () => boolean;
};

type EmailBodyEditorProps = {
  onChange: (html: string) => void;
  editable?: boolean;
};

function toolbarButtonClass(active: boolean): string {
  return [
    "px-2.5 py-1.5 text-xs font-bold bg-white border rounded-md hover:bg-gray-50 transition-colors",
    active ? "border-blue-600 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-700",
  ].join(" ");
}

const EmailBodyEditor = forwardRef<EmailBodyEditorHandle, EmailBodyEditorProps>(
  function EmailBodyEditor({ onChange, editable = true }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false,
          blockquote: false,
          codeBlock: false,
          code: false,
          horizontalRule: false,
        }),
      ],
      immediatelyRender: false,
      editable,
      content: "",
      editorProps: {
        attributes: {
          class:
            "email-tiptap-editor h-full min-h-[280px] w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-100",
        },
      },
      onUpdate: ({ editor: ed }) => {
        onChange(ed.getHTML());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        setContent: (html: string) => {
          if (!editor) return;
          editor.commands.setContent(html || "", { emitUpdate: true });
        },
        getContent: () => editor?.getHTML() ?? "",
        isEmpty: () => editor?.isEmpty ?? true,
      }),
      [editor],
    );

    useEffect(() => {
      editor?.setEditable(editable);
    }, [editor, editable]);

    if (!editor) {
      return (
        <div className="h-full min-h-[280px] w-full rounded-lg border border-gray-200 bg-gray-50 animate-pulse" />
      );
    }

    return (
      <>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={toolbarButtonClass(editor.isActive("bold"))}
            title="Bold"
          >
            B
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${toolbarButtonClass(editor.isActive("italic"))} italic`}
            title="Italic"
          >
            I
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${toolbarButtonClass(editor.isActive("underline"))} underline`}
            title="Underline"
          >
            U
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={toolbarButtonClass(editor.isActive("bulletList"))}
            title="Bullet List"
          >
            Bullets
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={toolbarButtonClass(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            Numbered
          </button>
        </div>

        <div className="relative h-[calc(100%-44px)] min-h-[280px]">
          <EditorContent editor={editor} className="h-full [&_.tiptap]:h-full" />
        </div>
      </>
    );
  },
);

export default EmailBodyEditor;
