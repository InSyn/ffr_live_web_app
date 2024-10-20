<template>
  <div class="imageUpload__wrapper">
    <div class="imagePreview">
      <img v-if="imagePreview" :src="imagePreview" alt="Selected Image" />
      <div v-else class="imageFiller">
        <v-icon class="imageFiller__icon" size="3rem">
          {{ fillerIcon }}
        </v-icon>
      </div>
    </div>

    <input
      id="image_url"
      class="formControl-image"
      name="image_url"
      type="file"
      @change="onFileChange($event, 'event-logo')"
    />
  </div>
</template>

<script>
import { mdiImage } from "@mdi/js";

export default {
  name: "fileUpload-control",
  props: ["imageName", "isCompact"],
  methods: {},
  data() {
    return {
      fillerIcon: mdiImage,
      imagePreview: null,
    };
  },
};
</script>

<style scoped></style>
