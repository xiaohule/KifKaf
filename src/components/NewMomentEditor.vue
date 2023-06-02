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
import { ref, onMounted, onBeforeUnmount, watchEffect } from 'vue';
import { useMomentsStore } from './../stores/moments.js'

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  }
});
const emits = defineEmits(['update:modelValue', 'create:editor']);
const editor = ref(null);

const momentsStore = useMomentsStore()

watchEffect(() => {
  if (editor.value) {
    const isSame = editor.value.getHTML() === props.modelValue;
    if (!isSame) {
      editor.value.commands.setContent(props.modelValue, false);
    }
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
    onCreate: () => {
      // The editor is ready.
      emits('create:editor', editor.value);
    },
    onUpdate: () => {
      emits('update:modelValue', editor.value.getHTML());
      console.log('Editor updated! editor.value.getHTML() gives:', editor.value.getHTML())
    },
    onFocus: () => {
      // The editor is focused.
      momentsStore.setIsEditorFocused(true)
    },
    onBlur: () => {
      // The editor isn’t focused anymore.
      momentsStore.setIsEditorFocused(false)
    },
  })
});

onBeforeUnmount(() => {
  editor.value.destroy();
});
</script>

<style lang="scss">
.ProseMirror {
  background: white;
  padding: 10px;
  border-radius: 14px;
  // border: 3px solid #0D0D0D;
  // border-radius: 0.5rem;
  // margin: 1rem 0;
  // >*+* {
  //   margin-top: 0.75em;
  // }
  // min-height: 100px;

  &:focus-visible {
    outline: none;
  }

  p {
    margin: 0;
  }

  p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #000000;
    pointer-events: none;
    height: 0;
    opacity: 0.5;
  }
}

.mention {
  color: $primary;
  padding: 0.1rem 0.3rem;
  // box-decoration-break: clone;
  // -webkit-box-decoration-break: clone;
  // border: 1px solid $primary;
  // border-radius: 0.4rem;
  // background-color: #a6bfff;
}

// .placeholder {
//   color: #961f1f;
// }
</style>

<!-- <style lang="scss" scoped>
span {
  color: $primary;
  padding: 0.1rem 0.3rem;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
</style> -->
