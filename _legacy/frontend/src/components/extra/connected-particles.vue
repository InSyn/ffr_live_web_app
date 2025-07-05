<template>
  <section class="wrapper">
    <canvas id="canvas"></canvas>
  </section>
</template>

<script>
import { debounce } from '@/utils/debounce';

export default {
  name: 'connected-particles',
  data() {
    return {
      render: false,
      canvas: null,
      canvasContext: null,
      particles: [],
      properties: {
        canvasWidth: '',
        canvasHeight: '',
        backgroundColor: 'transparent',
        particleRadius: 3,
        particleCount: 100,
        particleColor: 'rgba(2,159,226,1)',
        particleMaxVelocity: 0.25,
        lineLength: 145,
      },
    };
  },
  computed: {
    canvWrapper() {
      return document.querySelector('.wrapper');
    },
  },
  methods: {
    initialize() {
      this.canvas = document.querySelector('#canvas');
      this.canvasContext = this.canvas.getContext('2d');

      this.updateCanvasSize();

      this.handleResize = () => {
        debounce(
          this.$nextTick(() => {
            this.updateCanvasSize();
          })
        );
      };

      window.addEventListener('resize', this.handleResize);

      for (let i = 0; i < this.properties.particleCount; i++) {
        this.particles.push(this.generateParticle());
      }

      this.render = true;
      this.loop();
    },

    updateCanvasSize() {
      const wrapper = document.querySelector('.wrapper');

      this.properties.canvasWidth = wrapper.clientWidth;
      this.properties.canvasHeight = wrapper.clientHeight;

      this.canvas.width = this.properties.canvasWidth;
      this.canvas.height = this.properties.canvasHeight;
    },

    generateParticle() {
      return {
        x: Math.random() * this.properties.canvasWidth,
        y: Math.random() * this.properties.canvasHeight,

        velocityX: Math.random() * this.properties.particleMaxVelocity * 2 - this.properties.particleMaxVelocity,
        velocityY: Math.random() * this.properties.particleMaxVelocity * 2 - this.properties.particleMaxVelocity,
      };
    },
    setParticlePosition(particle) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      if (particle.x <= this.properties.particleRadius || particle.x >= this.properties.canvasWidth - this.properties.particleRadius) {
        particle.velocityX = -particle.velocityX;
      }
      if (particle.y <= this.properties.particleRadius || particle.y >= this.properties.canvasHeight - this.properties.particleRadius) {
        particle.velocityY = -particle.velocityY;
      }
    },
    redrawParticle(particle) {
      this.setParticlePosition(particle);

      this.canvasContext.beginPath();
      this.canvasContext.arc(particle.x, particle.y, this.properties.particleRadius, 0, Math.PI * 2);
      this.canvasContext.closePath();
      this.canvasContext.fillStyle = this.properties.particleColor;
      this.canvasContext.fill();
    },
    updateParticles() {
      this.particles.forEach((particle) => this.redrawParticle(particle));
    },

    connectAndRepelParticles() {
      let x1, y1, x2, y2, distance, distanceRatio;

      this.particles.forEach((particle_1, p_idx) => {
        this.particles.forEach((particle_2, ip_idx) => {
          if (p_idx === ip_idx) return;

          x1 = particle_1.x;
          y1 = particle_1.y;
          x2 = particle_2.x;
          y2 = particle_2.y;

          distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

          if (distance <= this.properties.lineLength) {
            this.canvasContext.lineWidth = 0.5;

            distanceRatio = 1 - distance / this.properties.lineLength;

            const color =
              getComputedStyle(document.documentElement).getPropertyValue('--accent') +
              Math.round(10 * distanceRatio * 16)
                .toString(16)
                .padStart(2, '0');

            this.canvasContext.strokeStyle = color;
            // `rgba(${2 * distanceRatio},${159 * distanceRatio},${226 * distanceRatio}, ${distanceRatio})`;

            this.canvasContext.beginPath();
            this.canvasContext.moveTo(x1, y1);
            this.canvasContext.lineTo(x2, y2);
            this.canvasContext.closePath();
            this.canvasContext.stroke();
          }
          if (distance < this.properties.lineLength / Math.log(distance ** 2)) {
            const angle = Math.atan2(y2 - y1, x2 - x1);

            const force = (this.properties.lineLength / 4 - distance) / this.properties.lineLength / 2;
            const fx = Math.cos(angle) * force * 0.005;
            const fy = Math.sin(angle) * force * 0.005;

            particle_1.velocityX -= fx;
            particle_1.velocityY -= fy;
            particle_2.velocityX += fx;
            particle_2.velocityY += fy;
          }
        });
      });
    },

    redrawBackground() {
      this.canvasContext.fillStyle = this.properties.backgroundColor;
      this.canvasContext.fillRect(0, 0, this.properties.canvasWidth, this.properties.canvasHeight);
    },
    loop() {
      if (!this.render) return;

      this.canvasContext.clearRect(0, 0, this.properties.canvasWidth, this.properties.canvasHeight);
      this.redrawBackground();
      this.updateParticles();
      this.connectAndRepelParticles();

      requestAnimationFrame(this.loop);
    },
  },
  mounted() {
    this.$nextTick(this.initialize);
  },
  beforeDestroy() {
    this.render = false;
    window.removeEventListener('resize', this.handleResize);
  },
};
</script>

<style scoped>
.wrapper {
  flex: 1 1 0;
  overflow: hidden; /* Prevent content overflow */

  canvas {
    //height: 100%;
    //width: 100%;
  }
}
</style>
