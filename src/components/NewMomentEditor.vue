<template>
  <editor-content v-if="editor" :editor="editor" />
</template>

<script setup>
import { Editor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import suggestion from './../composables/suggestion'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
});
const emits = defineEmits(['update:modelValue']);
const editor = ref(null);

watch(props.modelValue, (value) => {
  //Text
  const isSame = editor.value.getText() === value;
  //HTML
  // const isSame = editor.value.getHTML() === value;
  // JSON
  // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)
  if (!isSame) {
    editor.value.commands.setContent(value, false);
  }
});

onMounted(() => {
  editor.value = new Editor({
    // editorProps: {
    //   attributes: {
    //     class: 'editor',
    //   },
    // },
    extensions: [
      Document,
      Paragraph,
      Text,
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
      Placeholder.configure({
        placeholder: 'Feeling ... when/at/to ...  #mytag',
        HTMLAttributes: {
          class: 'placeholder',
        },
      }),
      // Use different placeholders depending on the node type:
      // placeholder: ({ node }) => {
      //   if (node.type.name === 'heading') {
      //     return 'What’s the title?'
      //   }
      //   return 'Can you add some further context?'
      // },
      //TODO: make rolling placeholders to avoid boredom
    ],
    content: props.modelValue,
    onUpdate: () => {
      emits('update:modelValue', editor.value.getText());
    },
  })
  console.log('editor.value', editor.value)
});

onBeforeUnmount(() => {
  editor.value.destroy();
});

// editor.isEmpty
// Remove all content from the document
// editor.commands.clearContent()

</script>

<style lang="scss">
.ProseMirror {
  background: white;
  padding: 10px 10px 0.5px 10px;
  border-radius: 14px;
  // border: 3px solid #0D0D0D;
  // border-radius: 0.5rem;
  // margin: 1rem 0;
  // >*+* {
  //   margin-top: 0.75em;
  // }
}

.mention {
  color: $primary;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
  // border: 1px solid $primary;
  // border-radius: 0.4rem;
  // background-color: #a6bfff;
}

/* Placeholder (at the top) */
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #000000;
  pointer-events: none;
  height: 0;
  opacity: 0.5;
}

// .ProseMirror p {
//   margin: 1em 0;
// }

// .placeholder {
//   color: #961f1f;
// }
</style>
