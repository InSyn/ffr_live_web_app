<template>
  <div class="documentsComponent">
    <div
      v-for="(document, index) in documents"
      :key="index"
      class="document__item"
    >
      <div class="control__wrapper">
        <label>Название</label>
        <input
          type="text"
          v-model="document.title"
          placeholder="Введите название документа"
          @input="updateDocumentTitle(index, document.title)"
        />
      </div>
      <div v-if="document.file && document.file.url" class="existingFile">
        <a :href="uploadsFolderUrl + document.file.url" target="_blank">
          Прикреплённый файл
        </a>
      </div>

      <input type="file" @change="onFileChange($event, index)" />

      <v-btn
        @click="removeDocument(index)"
        color="var(--message-error)"
        x-small
        text
        >Удалить</v-btn
      >
    </div>

    <v-btn @click="addDocument" color="var(--accent)" small text>
      Добавить документ
    </v-btn>
  </div>
</template>

<script>
import { uploadsFolderUrl } from "@/store/constants";

export default {
  name: "documents-select-control",
  props: {
    initialDocuments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      documents: [],
    };
  },
  computed: {
    uploadsFolderUrl() {
      return uploadsFolderUrl;
    },
  },
  methods: {
    addDocument() {
      this.documents.push({
        title: "",
        file: null,
      });
      this.emitDocumentsUpdate();
    },
    removeDocument(index) {
      this.documents.splice(index, 1);
      this.emitDocumentsUpdate();
    },
    onFileChange(event, index) {
      const file = event.target.files[0];
      if (file) {
        this.documents[index].file = {
          ...this.documents[index].file,
          newFile: file,
        };
        this.emitDocumentsUpdate();
      }
    },
    updateDocumentTitle(index, title) {
      this.documents[index].title = title;
      this.emitDocumentsUpdate();
    },
    emitDocumentsUpdate() {
      this.$emit("update:documents", this.documents);
    },
  },

  created() {
    this.documents = [...this.initialDocuments];
  },
  watch: {
    initialDocuments(newDocuments) {
      this.documents = [...newDocuments];
    },
  },
};
</script>

<style scoped lang="scss">
.documentsComponent {
  flex: 1 1 auto;
  font-size: 0.75rem;

  .document__item {
    display: flex;
    flex-direction: column;
    margin-bottom: 8px;

    button {
      align-self: flex-end;
    }
    input {
    }
    .existingFile {
      align-self: flex-start;
      margin-bottom: 0.5rem;
      padding: 3px 6px;
      border: 1px solid var(--text-contrast);
      border-radius: 2px;
      &:hover {
        color: var(--text-hovered);
        box-shadow: 0 0 0 1px var(--text-hovered) inset;
      }
    }
    .control__wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      label {
        margin-right: 1rem;
      }
      input {
        flex: 1 1 0;
        min-width: 0;
        padding: 3px 6px;
        color: var(--text-default);
        background-color: var(--background--card-secondary);
        outline: transparent;
      }
    }
  }
  button {
  }
}
</style>
