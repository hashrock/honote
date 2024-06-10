<template>
  <div class="app">
    <Header :user="user"></Header>

    <div class="layout">
      <div>docId: <input type="text" id="documentId" v-model="documentId" /></div>

      <div>title: <input type="text" id="title" v-model="title" /></div>
      <div>
        <textarea id="editor" v-model="editor"></textarea>
      </div>
      <div>
        <button id="save" @click="save">Save</button>
        <button id="delete" @click="delete">Delete</button>
      </div>

      <div id="updatedAt">{{ updatedAt }}</div>

      <div>
        <select id="list" v-model="selectedId" @change="load">
          <option v-for="item in list" :value="item.id">{{ item.title }} - {{ item.updatedAt }}</option>
        </select>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Memo, User } from './types';
import Header from "./components/Header.vue";

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
      list: [] as Memo[],
      selectedId: '',
      user: null as User | null,
    };
  },
  methods: {
    async loadMemo() {
      const res = await fetch("/api/memo", {
        credentials: 'include',
      });
      const data = await res.json();
      this.list = data;
    },

    async loadUser() {
      const res = await fetch("/api/user", {
        credentials: 'include',
      });
      const data = await res.json();


      this.user = data.user;
      console.log(data);
    },

    async load() {
      const res = await fetch(`/api/memo/${this.selectedId}`, {
        credentials: 'include',
      });
      const data = await res.json();
      this.documentId = data.id;
      this.title = data.title;
      this.editor = data.body;
      const updatedAt = new Date(data.updatedAt);
      this.updatedAt = updatedAt.toLocaleString();
    },
    async save() {
      if (this.documentId) {
        const data = {
          title: this.title,
          body: this.editor
        };
        const res = await fetch(`/api/memo/${this.documentId}`, {
          method: "PUT",
          body: JSON.stringify({ data }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
        });
        const resjson = await res.json();
        const updatedAt = new Date(resjson.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();

      } else {
        const data = {
          title: this.title,
          body: this.editor
        };
        const res = await fetch("/api/memo", {
          method: "POST",
          body: JSON.stringify({ data }),
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
        });
        const resjson = await res.json();
        const updatedAt = new Date(resjson.updatedAt);
        this.updatedAt = updatedAt.toLocaleString();
      }

      this.loadMemo();
    }
  },

  mounted() {
    this.loadUser()
    this.loadMemo()
  },

});

</script>

<style>
body {
  margin: 0;
}

.app {
  /* margin: 20px; */
}

.layout {
  margin: 20px;
}
</style>
