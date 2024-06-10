<template>
  <div class="header">
    <img v-if="user" :src="user.avatarUrl" alt="avatar" class="avatar" />
    <div v-if="user">{{ user.login }}</div>
    <div v-if="user">
      <a href="/api/signout">
        Sign out
      </a>
    </div>
    <div v-else>
      <a href="/api/signin">
        Sign in
      </a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { User } from '../types';

export default defineComponent({
  props: {
    user: {
      type: Object as () => User | null,
      required: true,
    },
  },
  data() {
    return {
    };
  },
})

</script>

<style>
.header {
  background-color: #f0f0f5;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 16px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>