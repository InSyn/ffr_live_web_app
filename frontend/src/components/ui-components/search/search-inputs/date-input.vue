<template>
	<input class="searchInput__control" type="date" @input="$emit('input', $event.target.value)" />
</template>

<script>
export default {
	name: 'DateInput'
}
</script>
