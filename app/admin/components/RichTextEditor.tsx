"use client";

import BulletList from "@tiptap/extension-bullet-list";
import Document from "@tiptap/extension-document";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Image from "@tiptap/extension-image";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image as ImageIcon,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function RichTextEditorComponent({
  value,
  onChange,
  placeholder = "Start typing here...",
  disabled = false,
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        hardBreak: false,
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc ml-4",
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal ml-4",
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "ml-4",
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: "rounded-lg border max-w-full h-auto",
        },
      }),
    ],
    content: value || `<p>${placeholder}</p>`,
    editorProps: {
      attributes: {
        class: `prose dark:prose-invert px-3 min-h-[200px] focus:outline-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`,
        placeholder: disabled ? "" : placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (!disabled) {
        const html = editor.getHTML();
        onChange(html);
        // Log images in content for debugging
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const images = doc.querySelectorAll("img");
        images.forEach((img) =>
          console.log("Editor image src:", img.src.substring(0, 50) + "...")
        );
      }
    },
    autofocus: !disabled,
    editable: !disabled,
    immediatelyRender: false,
  });

  useEffect(() => {
    setMounted(true);
    if (editor && !editorRef.current) {
      editorRef.current = editor;
    }
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [editor]);

  useEffect(() => {
    if (mounted && editor && value !== editor.getHTML() && !disabled) {
      const { from } = editor.state.selection;
      editor.commands.setContent(value, { emitUpdate: false });
      editor.commands.setTextSelection(from);
    }
  }, [value, mounted, editor, disabled]);

  const handleImageUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !editor) return;
      const file = event.target.files?.[0];
      if (!file) return;

      try {
        // Compress the image
        const options = {
          maxSizeMB: 0.2,
          maxWidthOrHeight: 768,
          useWebWorker: true,
          fileType: "image/jpeg",
        };
        const compressedFile = await imageCompression(file, options);

        // Convert to base64
        const base64Url =
          await imageCompression.getDataUrlFromFile(compressedFile);
        console.log(
          "Base64 image URL (first 50 chars):",
          base64Url.substring(0, 50) + "..."
        );

        // Insert image into editor
        editor
          .chain()
          .focus()
          .setImage({ src: base64Url, alt: file.name })
          .run();
        // Force editor update to ensure image renders
        editor.commands.setContent(editor.getHTML());
        toast.success("Image attached successfully");
      } catch (error) {
        console.error("Image upload error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to attach image"
        );
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, disabled]
  );

  if (!mounted || !editor) {
    return (
      <div className='min-h-[200px] border rounded-md p-4 bg-gray-50 animate-pulse'>
        Loading editor...
      </div>
    );
  }

  return (
    <div className='w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm'>
      <div className='flex gap-2 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 rounded-t-md'>
        <ToolbarButton
          editor={editor}
          command='toggleBold'
          icon={Bold}
          active='bold'
          tooltip='Bold (Ctrl+B)'
        />
        <ToolbarButton
          editor={editor}
          command='toggleItalic'
          icon={Italic}
          active='italic'
          tooltip='Italic (Ctrl+I)'
        />
        <ToolbarButton
          editor={editor}
          command='toggleUnderline'
          icon={Underline}
          active='underline'
          tooltip='Underline (Ctrl+U)'
        />
        <ToolbarButton
          editor={editor}
          command='toggleBulletList'
          icon={List}
          active='bulletList'
          tooltip='Bullet List'
        />
        <ToolbarButton
          editor={editor}
          command='toggleOrderedList'
          icon={ListOrdered}
          active='orderedList'
          tooltip='Numbered List'
        />
        <button
          type='button'
          className={`p-2 rounded-md transition ${
            disabled
              ? "cursor-not-allowed opacity-50"
              : "hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
          onClick={() => !disabled && fileInputRef.current?.click()}
          disabled={disabled}
          title='Insert Image'>
          <ImageIcon size={20} className='text-gray-700 dark:text-gray-300' />
        </button>
        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          className='hidden'
          onChange={handleImageUpload}
        />
      </div>
      <div className='px-2 py-3'>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  editor: Editor | null;
  command:
    | "toggleBold"
    | "toggleItalic"
    | "toggleUnderline"
    | "toggleBulletList"
    | "toggleOrderedList";
  icon: React.ElementType;
  active: string;
  disabled?: boolean;
  tooltip?: string;
}

function ToolbarButton({
  editor,
  command,
  icon: Icon,
  active,
  tooltip = "",
}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      className={`p-2 rounded-md transition ${
        editor?.isActive(active)
          ? "bg-gray-300 dark:bg-gray-700"
          : "hover:bg-gray-200 dark:hover:bg-gray-700"
      }`}
      onClick={() => editor?.chain().focus()[command]().run()}
      title={tooltip}
      aria-label={tooltip}>
      <Icon size={20} className='text-gray-700 dark:text-gray-300' />
    </button>
  );
}

export const RichTextEditor = dynamic(
  () => Promise.resolve(RichTextEditorComponent),
  {
    ssr: false,
    loading: () => (
      <div className='min-h-[200px] border rounded-md bg-gray-50 animate-pulse' />
    ),
  }
);
