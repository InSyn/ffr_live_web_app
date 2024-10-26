<template>
  <div>
    <canvas id="mountains"></canvas>
  </div>
</template>
<script>
import * as rive from '@rive-app/canvas';

export default {
  name: 'bg-mountains',
  methods: {
    async loadBackground() {
      const canvas = document.getElementById('mountains');

      const bgLayout = new rive.Layout({
        fit: rive.Fit.Cover,
        alignment: rive.Alignment.BottomLeft,
      });
      const riveBg = new rive.Rive({
        canvas: canvas,
        src: '/ffr_background.riv',
        layout: bgLayout,
        autoplay: true,
        onLoad: () => {
          riveBg.resizeDrawingSurfaceToCanvas();
        },
      });
    },
  },

  mounted() {
    this.loadBackground();
  },
};
</script>

<style scoped lang="scss">
div {
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgb(63, 93, 128), rgb(18, 70, 125), rgb(121, 157, 193), rgb(202, 226, 246), rgb(60, 111, 159), rgb(165, 195, 224));
    background-size: 300% 300%;
    animation: gradientAnimation 40s ease-in-out infinite alternate;
  }

  canvas {
    position: relative;
    height: 100%;
    width: 100%;
    object-fit: cover;
    object-position: top left;
    opacity: 0;
    animation: fadeInCanvas 0.6s ease-in forwards;
  }
}

@keyframes gradientAnimation {
  25% {
    background-position: 0 0;
  }
  25% {
    background-position: 50% 100%;
  }
  50% {
    background-position: 100% 125%;
  }
  75% {
    background-position: 175% 150%;
  }
  100% {
    background-position: 200% 200%;
  }
}

@keyframes fadeInCanvas {
  100% {
    opacity: 1;
  }
}
</style>
