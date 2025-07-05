<template>
	<div id="app" class="d-flex-col">
		<v-app data-app="true">
			<router-view />
			<search-mobile />
		</v-app>
	</div>
</template>

<script>
import SearchMobile from '@/components/ui-components/search/search-mobile.vue'
// Test comment
import { mapActions } from 'vuex'
import { setAppHeight } from '@/utils/mobileHeightResize-util'

export default {
	name: 'App',
	components: {
		SearchMobile
	},
	methods: {
		...mapActions('authorization', {
			checkStoredUserData: 'CHECK_STORED_DATA'
		})
	},

	mounted() {
		window.addEventListener('resize', setAppHeight)
		setAppHeight()

		this.checkStoredUserData()

		if (this.$route.name === 'Main') this.$router.push({ name: 'results' })
	}
}
</script>

<style lang="scss"></style>
