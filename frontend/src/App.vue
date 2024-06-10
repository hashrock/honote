<template>
  <div class="app">
    <Header :user="user"></Header>

    <div class="layout">

      <div class="editorLayout">
        <select class="memo" v-model="selectedId" @change="load">
          <option value="">New memo</option>
          <option v-for="item in memos" :value="item.id">{{ item.title }} - {{ item.updatedAt }}</option>
        </select>

        <input type="text" class="title" v-model="title" />
        <textarea v-model="editor" class="editor"></textarea>
      </div>

      <div>
        <button class="action" @click="save">Save</button>
        <button class="action" @click="removeMemo">Delete</button>
      </div>

      <div class="updatedAt">{{ updatedAt }}</div>


    </div>


  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Memo, User } from './types';
import Header from "./components/Header.vue";
import { listMemo, fetchUserData, getMemo, updateMemo, postMemo, deleteMemo } from './api';
import { useDebounceFn } from '@vueuse/core'

export default defineComponent({
  components: {
    Header,
  },
  data() {
    return {
      documentId: '',
      title: '',
      oldTitle: '',
      editor: '',
      oldEditor: '',
      updatedAt: '',
      memos: [] as Memo[],
      selectedId: '',
      user: null as User | null,
      debounceSave: null as any,
    };
  },

  watch: {
    editor: {
      handler: function (_value) {
        if (this.editor === this.oldEditor) {
          return;
        }
        this.debounceSave()
      },
      deep: true
    },
    title: {
      handler: function (_value) {
        if (this.title === this.oldTitle) {
          return;
        }
        this.debounceSave()
      },
      deep: true
    }
  },
  methods: {
    async loadMemos() {
      this.memos = await listMemo();
    },

    async loadUser() {
      this.user = await fetchUserData()
    },

    clear() {
      this.documentId = '';
      const newTitle = "untitled " + new Date().toLocaleString();
      this.title = newTitle;
      this.oldTitle = newTitle;
      this.editor = '';
      this.oldEditor = '';
      this.updatedAt = '';
    },

    async removeMemo() {
      if (!this.documentId) {
        return;
      }

      if (!confirm('Are you sure to delete?')) {
        return;
      }

      await deleteMemo(this.documentId);
      this.loadMemos();
      this.clear();
    },

    async load() {
      if (!this.selectedId) {
        this.clear();
        return;
      }

      const data = await getMemo(this.selectedId);
      this.documentId = data.id;
      this.title = data.title;
      this.oldTitle = data.title;
      this.editor = data.body;
      this.oldEditor = data.body;

      const updatedAt = new Date(data.updatedAt);
      this.updatedAt = updatedAt.toLocaleString();
    },
    async save() {
      if (this.documentId) {
        const json = await updateMemo(this.documentId, this.title, this.editor);
        const updatedAt = new Date(json.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();
      } else {
        const json: Memo = await postMemo(this.title, this.editor);
        const updatedAt = new Date(json.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();
        this.documentId = json.id;
        this.selectedId = json.id;
      }

      this.loadMemos();
    }
  },

  created() {
    this.debounceSave = useDebounceFn(this.save, 1000)
  },

  mounted() {
    this.loadUser()
    this.loadMemos()
  },

});

</script>

<style>
body {
  margin: 0;
}

.layout {
  margin: 20px;
}

select.memo {
  padding: 4px;
  border: none;
  font-size: inherit;
}

input.title {
  padding: 4px;
  font-size: 1.5rem;
}

textarea.editor {
  height: 300px;
  padding: 4px;
  font-size: 16px;
}

.editorLayout {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
