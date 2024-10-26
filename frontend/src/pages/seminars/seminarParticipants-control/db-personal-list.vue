<template>
  <div class="dbPerson__list__wrapper">
    <div class="personList__header">
      <div class="personList__title">
        {{ translateTitle(personalType) }}
      </div>
      <div class="personSearch__box">
        <input class="personSearch__box__input" v-model="searchText" type="text" placeholder="Искать..." />
      </div>
    </div>

    <div class="dbPerson__list">
      <div :class="['dbPerson__item', editingPersonId === person._id && 'editingPerson']" v-for="person in getFilteredPersonal" :key="person._id">
        <div @click="editPerson(person._id)" class="dbPerson__item__name">
          <span v-if="personalType === 'athletes' || personalType === 'jury'">{{ `${person.lastname ? person.lastname : ''} ${person.name}` }}</span>
          <span v-else>{{ `${person.fullname}` }}</span>
          <span>
            {{ person.jury_code || person.trainer_id || person.rus_code }}
          </span>
        </div>
        <div class="dbPerson__item__menu">
          <label :for="person._id + '_role'">Роль</label>
          <input @keyup.enter="addDbPerson(person)" :id="person._id + '_role'" type="text" placeholder="Введите роль" />

          <v-btn @click="addDbPerson(person)" color="var(--accent)" small text> Добавить </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'db-personal-list',
  props: {
    personalType: String,
    personal: {
      type: Array,
      default: () => [],
    },
    editingPersonId: String,
  },
  data() {
    return {
      searchText: '',
    };
  },
  computed: {
    getFilteredPersonal() {
      if (!this.searchText) {
        return this.personal;
      }
      const searchText = this.searchText.toLowerCase();

      switch (this.personalType) {
        case 'jury':
          return this.personal.filter((person) => {
            return person.fullname.toLowerCase().includes(searchText) || person.jury_code.includes(searchText);
          });
        case 'trainers':
          return this.personal.filter((person) => {
            return person.fullname.toLowerCase().includes(searchText) || person.trainer_id.includes(searchText);
          });
        case 'athletes':
          return this.personal.filter((person) => {
            return (
              person.lastname.toLowerCase().includes(searchText) || person.name.toLowerCase().includes(searchText) || person.rus_code.includes(this.searchText)
            );
          });
        default:
          return this.personal;
      }
    },
  },
  methods: {
    addDbPerson(person) {
      this.$emit('add-person', person);
    },
    editPerson(personId) {
      this.$emit('edit-person', personId);
    },

    translateTitle(title) {
      switch (title) {
        case 'jury':
          return 'Судьи';
        case 'trainers':
          return 'Тренеры';
        case 'athletes':
          return 'Спортсмены';
        default:
          return title;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.dbPerson__list__wrapper {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  min-height: 160px;
  padding: 0.75rem;

  background-color: var(--background--card);
  border-radius: 4px;

  .personList__header {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
    margin-bottom: 0.75rem;
    font-size: 1.15rem;

    .personList__title {
      flex: 4 1 auto;
    }

    .personSearch__box {
      flex: 2 1 12ch;
      display: flex;

      .personSearch__box__input {
        flex: 1 1 0;
        min-width: 0;
        padding: 3px 6px;
        background-color: var(--background--card-secondary);
        border-radius: 2px;

        &:focus {
          background-color: var(--background--card-hover);
          outline-color: var(--text-hovered);
        }
      }
    }
  }

  .dbPerson__list {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    overflow-y: auto;
    padding-right: 1.25rem;

    .dbPerson__item {
      flex: 0 0 auto;
      display: flex;
      flex-direction: column;
      padding: 0.25rem;
      border-radius: 4px;

      .dbPerson__item__name {
        flex: 0 0 auto;
        display: flex;
        justify-content: space-between;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;

        &:hover {
          color: var(--text-hovered);
        }
      }

      .dbPerson__item__menu {
        display: none;
        flex: 0 0 auto;
        align-items: center;
        margin-top: 0.5rem;
        font-size: 0.85rem;

        label {
          font-weight: bold;
          margin-right: 0.5rem;
        }

        input {
          padding: 0.1rem 0.5rem;
          background-color: var(--background--card-secondary);
          border-radius: 2px;

          &:focus-visible {
            background-color: var(--background--card-hover);
            outline: 1px solid var(--text-default);
          }
        }

        button {
          height: 2rem;
          margin-left: auto;
          padding: 0 1rem !important;
        }
      }

      &.editingPerson {
        padding: 0.25rem 0.5rem;
        border: 1px solid var(--accent);

        .dbPerson__item__menu {
          display: flex;
        }
      }
    }
  }
}
</style>
