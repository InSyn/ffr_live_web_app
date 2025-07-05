import createEventPage from '@/pages/admin-pages/events/createPage-event.vue'
import eventPage from '@/pages/events/event-page/index.vue'
import editEventPage from '@/pages/admin-pages/events/editPage-event.vue'
import eventOnlineRegistration from '@/pages/admin-pages/online-registration/event-online-registration.vue'
import eventOnlineRegistrationApplication from '@/pages/admin-pages/online-registration/event-online-registration-application.vue'
import createPageCupEvent from '@/pages/admin-pages/events/createPage-cupEvent.vue'

export const eventRoutes = [
	{
		name: 'createEventPage',
		path: 'new-event',
		component: createEventPage,
		meta: { requiresAuth: true }
	},
	{
		name: 'editEventPage',
		path: 'edit-event/:event_id',
		props: true,
		component: editEventPage,
		meta: { requiresAuth: true }
	},
	{
		name: 'eventPage',
		path: 'event-page/:event_id',
		props: true,
		component: eventPage
	},

	{
		name: 'cupEventPage',
		path: 'new-cup-event',
		component: createPageCupEvent
	},

	{
		name: 'eventOnlineRegistration',
		path: 'event-online-registration/:event_id',
		props: true,
		component: eventOnlineRegistration
	},
	{
		name: 'eventOnlineRegistrationApplication',
		path: 'event-online-registration-application/:event_id/:application_id?',
		props: true,
		component: eventOnlineRegistrationApplication
	}
]
