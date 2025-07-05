import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'
import CompetitionListItem from '@/pages/events/competition-list-item.vue'
import { backendRootUrl } from '@/constants'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

describe('CompetitionListItem.vue', () => {
	let wrapper
	const event = {
		id: '123',
		title: 'Test Event',
		sport: 'Test Sport',
		discipline: 'Test Discipline',
		start_at: '2023-10-27T10:00:00.000Z',
		country: 'Russia',
		region: 'Moscow',
		location: 'Moscow',
		logo_image_url: '/logos/test.png',
		calendar_code: '12345'
	}

	beforeEach(() => {
		wrapper = shallowMount(CompetitionListItem, {
			propsData: { event, index: 0, dateMatch: false },
			localVue,
			router,
			stubs: {
				'country-flag': true,
				'competition-image-filler-icon': true
			}
		})
	})

	it('renders event title', () => {
		expect(wrapper.find('.competition__link__header__title').text()).toBe(event.title)
	})

	it('renders a router-link with the correct href', () => {
		expect(wrapper.find('router-link-stub').props().to).toBe(`/events/${event.id}`)
	})

	it('computes uploadsFolderUrl correctly', () => {
		expect(wrapper.vm.uploadsFolderUrl).toBe(backendRootUrl)
	})

	it('displays the event image when logo_image_url is present', () => {
		expect(wrapper.find('.competitionImage__image').exists()).toBe(true)
		expect(wrapper.find('.competitionImage__image').attributes('src')).toBe(
			backendRootUrl + event.logo_image_url
		)
		expect(wrapper.find('competition-image-filler-icon-stub').exists()).toBe(false)
	})

	it('displays the filler icon when logo_image_url is not present', async () => {
		await wrapper.setProps({
			event: { ...event, logo_image_url: null }
		})
		expect(wrapper.find('.competitionImage__image').exists()).toBe(false)
		expect(wrapper.find('competition-image-filler-icon-stub').exists()).toBe(true)
	})

	it('formats the date correctly', () => {
		// Assuming formatDate utility returns '27.10.2023' for the given date
		// This test might be brittle, a better approach would be to mock the utility
		// But for now, we check if the component renders the expected output.
		const formattedDate = '27.10.2023'
		expect(wrapper.find('.competition__link__footer__info__date').text()).toContain(formattedDate)
	})
})
