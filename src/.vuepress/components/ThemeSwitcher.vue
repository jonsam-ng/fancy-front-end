<template>
  <ClientOnly>
    <DarkMode class="themeWrapper">
      <template v-slot="{ mode }">
        <!-- Color mode: <span>{{ mode }}</span> -->
        <svg
          v-if="mode === 'light'"
          style=""
          class="icon"
          focusable="false"
          viewBox="0 0 32 32"
        >
          <path
            d="M16 12.005a4 4 0 1 1-4 4a4.005 4.005 0 0 1 4-4m0-2a6 6 0 1 0 6 6a6 6 0 0 0-6-6z"
            fill="currentColor"
          ></path>
          <path
            d="M5.394 6.813l1.414-1.415l3.506 3.506L8.9 10.318z"
            fill="currentColor"
          ></path>
          <path d="M2 15.005h5v2H2z" fill="currentColor"></path>
          <path
            d="M5.394 25.197L8.9 21.691l1.414 1.415l-3.506 3.505z"
            fill="currentColor"
          ></path>
          <path d="M15 25.005h2v5h-2z" fill="currentColor"></path>
          <path
            d="M21.687 23.106l1.414-1.415l3.506 3.506l-1.414 1.414z"
            fill="currentColor"
          ></path>
          <path d="M25 15.005h5v2h-5z" fill="currentColor"></path>
          <path
            d="M21.687 8.904l3.506-3.506l1.414 1.415l-3.506 3.505z"
            fill="currentColor"
          ></path>
          <path d="M15 2.005h2v5h-2z" fill="currentColor"></path>
        </svg>

        <svg
          v-else-if="mode === 'dark'"
          style=""
          class="icon"
          focusable="false"
          viewBox="0 0 32 32"
        >
          <path
            d="M13.502 5.414a15.075 15.075 0 0 0 11.594 18.194a11.113 11.113 0 0 1-7.975 3.39c-.138 0-.278.005-.418 0a11.094 11.094 0 0 1-3.2-21.584M14.98 3a1.002 1.002 0 0 0-.175.016a13.096 13.096 0 0 0 1.825 25.981c.164.006.328 0 .49 0a13.072 13.072 0 0 0 10.703-5.555a1.01 1.01 0 0 0-.783-1.565A13.08 13.08 0 0 1 15.89 4.38A1.015 1.015 0 0 0 14.98 3z"
            fill="currentColor"
          ></path>
        </svg>
        <svg
          t="1627993825575"
          v-else
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="6849"
          width="200"
          height="200"
        >
          <path
            d="M611.413333 853.333333h-8.96a85.333333 85.333333 0 0 1-75.093333-67.413333L413.013333 256l-117.76 273.066667A42.666667 42.666667 0 0 1 256 554.666667H128a42.666667 42.666667 0 0 1 0-85.333334h99.84l107.093333-247.04a85.333333 85.333333 0 0 1 161.706667 16.213334L610.986667 768l117.76-272.213333A42.666667 42.666667 0 0 1 768 469.333333h128a42.666667 42.666667 0 0 1 0 85.333334h-99.84l-107.093333 247.04A85.333333 85.333333 0 0 1 611.413333 853.333333z"
            p-id="6850"
          ></path>
        </svg>
      </template>
    </DarkMode>
  </ClientOnly>
</template>

<script>
import { DarkMode } from "@vue-a11y/dark-mode";

export default {
  components: {
    DarkMode,
  },
};
</script>

<style>
.icon {
  width: 1.25rem;
  height: 1.25rem;
}
.themeWrapper {
  padding: 0 20px;
}
</style>
