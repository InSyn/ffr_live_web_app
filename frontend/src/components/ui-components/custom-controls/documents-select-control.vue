<template>
	<div class="documentsComponent" :class="horizontal ? 'horizontal' : 'vertical'">
		<div v-for="(document, index) in documents" :key="index" class="document__item">
			<div class="control__wrapper">
				<label>Название</label>
				<input
					v-model="document.title"
					type="text"
					placeholder="Введите название документа"
					@input="updateDocumentTitle(index, document.title)"
				/>
			</div>
			<div v-if="document.file && document.file.url" class="existingFile">
				<a :href="getImageUrl(document.file.url)" target="_blank"> Прикреплённый файл </a>
			</div>

			<input type="file" @change="onFileChange($event, index)" />

			<v-btn color="var(--color-text-error)" x-small text @click="removeDocument(index)">
				Удалить
			</v-btn>
		</div>

		<v-btn color="var(--color-text-accent)" small text @click="addDocument">
			Добавить документ
		</v-btn>
	</div>
</template>

<script>
import { getImageUrl } from '@/utils/url-helpers'

export default {
	name: 'DocumentsSelectControl',
	props: {
		initialDocuments: {
			type: Array,
			default: () => []
		},
		horizontal: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			documents: []
		}
	},
	watch: {
		initialDocuments(newDocuments) {
			this.documents = [...newDocuments]
		}
	},

	created() {
		this.documents = [...this.initialDocuments]
	},
	methods: {
		getImageUrl,
		addDocument() {
			this.documents.push({
				title: '',
				file: null
			})
			this.emitDocumentsUpdate()
		},
		removeDocument(index) {
			this.documents.splice(index, 1)
			this.emitDocumentsUpdate()
		},
		onFileChange(event, index) {
			const file = event.target.files[0]
			if (file) {
				this.documents[index].file = {
					...this.documents[index].file,
					newFile: file
				}
				this.emitDocumentsUpdate()
			}
		},
		updateDocumentTitle(index, title) {
			this.documents[index].title = title
			this.emitDocumentsUpdate()
		},
		emitDocumentsUpdate() {
			this.$emit('update:documents', this.documents)
		}
	}
}
</script>

<style scoped lang="scss">
.documentsComponent {
	flex: 1 1 auto;
	font-size: 0.75rem;

	&.horizontal {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		grid-gap: 0.5rem 0.75rem;
		align-items: center;
	}

	&.vertical {
		display: flex;
		flex-direction: column;
		gap: 0.5rem 0.75rem;
	}

	.document__item {
		display: flex;
		flex-direction: column;

		button {
			align-self: flex-end;
		}

		.existingFile {
			align-self: flex-start;
			margin-bottom: 0.5rem;
			padding: 3px 6px;
			border: 1px solid var(--color-text-secondary);
			border-radius: 2px;

			&:hover {
				color: var(--text-hovered);
				box-shadow: 0 0 0 1px var(--text-hovered) inset;
			}
		}

		.control__wrapper {
			display: flex;
			align-items: center;
			margin-bottom: 8px;

			label {
				margin-right: 1rem;
			}

			input {
				flex: 1 1 0;
				min-width: 0;
				padding: 3px 6px;
				color: var(--color-text-primary);
				background-color: var(--color-bg-surface-secondary);
				outline: transparent;
			}
		}
	}
}
</style>
