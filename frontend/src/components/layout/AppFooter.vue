<script>
export default {
  name: "AppFooter",
};
</script>

<template>
  <div class="appFooter__wrapper">
    <div class="appFooter__content">
      <div class="appFooter__info">
        <span>Created by TimingWeb &copy;&nbsp;</span>
        <span class="projectDate">{{ new Date().getFullYear() }}</span>
        <img
          alt="SportTech-Logo"
          class="companyLogo__image"
          src="@/assets/logo/SPORTTECHLOGO-WHITE.png"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.appFooter__wrapper {
  position: relative;
  isolation: isolate;
  flex: 0 1 auto;

  &::before {
    position: absolute;
    z-index: 1;
    top: -4px;
    left: 0;
    width: 100%;
    height: 22px;
    background-color: var(--ffr-brand-accent);
    transform: skewY(-0.085deg);
    content: "";
  }
  .appFooter__content {
    position: relative;
    z-index: 2;
    background-color: var(--text-card-contrast);

    .appFooter__info {
      display: flex;
      align-items: center;
      max-width: var(--desktop-medium);
      margin: 0 auto;
      padding: 0.25rem 2rem;
      color: var(--text-card);
      font-size: 0.75rem;

      .companyLogo__image {
        margin-left: auto;
        max-height: 1.4rem;
      }
    }
  }
}
</style>
