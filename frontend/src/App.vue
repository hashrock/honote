<template>
  <div class="app">
    <Header :user="user"></Header>

    <div class="layout">

      <div>
        <select class="memo" v-model="selectedId" @change="load">
          <option value="">New memo</option>
          <option v-for="item in memos" :value="item.id">{{ item.title }} - {{ item.updatedAt }}</option>
        </select>
      </div>

      <div><input type="text" class="title" v-model="title" /></div>
      <div>
        <textarea v-model="editor" class="editor"></textarea>
      </div>
      <div>
        <button class="action" @click="save">Save</button>
        <button class="action" @click="delete">Delete</button>
      </div>

      <div class="updatedAt">{{ updatedAt }}</div>


    </div>


  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Memo, User } from './types';
import Header from "./components/Header.vue";
import { listMemo, fetchUserData, getMemo, updateMemo, postMemo } from './api';

export default defineComponent({
  components: {
    Header,
  },
  data() {
    return {
      documentId: '',
      title: '',
      editor: '',
      updatedAt: '',
      memos: [] as Memo[],
      selectedId: '',
      user: null as User | null,
    };
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
      this.title = "untitled " + new Date().toLocaleString();
      this.editor = '';
      this.updatedAt = '';
    },

    async load() {
      if (!this.selectedId) {
        this.clear();
        return;
      }

      const data = await getMemo(this.selectedId);
      this.documentId = data.id;
      this.title = data.title;
      this.editor = data.body;

      const updatedAt = new Date(data.updatedAt);
      this.updatedAt = updatedAt.toLocaleString();
    },
    async save() {
      if (this.documentId) {
        const json = await updateMemo(this.documentId, this.title, this.editor);
        const updatedAt = new Date(json.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();
      } else {
        const json = await postMemo(this.title, this.editor);
        const updatedAt = new Date(json.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();
      }

      this.loadMemos();
    }
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
  width: 100%;
}
</style>
