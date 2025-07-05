<template>
  <div class="seminarsControl__wrapper">
    <div class="seminarParticipants__select__wrapper">
      <div class="databasePersonal__wrapper">
        <db-personal-list
          v-for="personalType in ['jury', 'trainers', 'athletes']"
          :key="personalType"
          @add-person="addDbPerson"
          @edit-person="editPerson"
          :personal="getFilteredPersonalList(personalType)"
          :personal-type="personalType"
          :editing-person-id="editingPerson"
        ></db-personal-list>
      </div>

      <div class="addNewPerson__wrapper">
        <div class="newPerson__control__wrapper">
          <label for="role">Роль участника</label>
          <input id="role" type="text" placeholder="Введите роль" />
        </div>
        <div class="newPerson__control__wrapper">
          <label for="name">Имя участника</label>
          <input id="name" type="text" placeholder="Введите имя" />
        </div>
        <v-btn @click="addPerson" class="addPerson__button" color="var(--text-default)" text> Добавить </v-btn>
      </div>

      <div class="personal__list__wrapper">
        <div class="personal__list__title">Участники семинара</div>
        <div class="personal__list">
          <div class="personal__item__wrapper" v-for="(person, idx) in personal" :key="idx">
            <span>{{ person.fullname }}&nbsp;-&nbsp;</span>
            <input type="text" v-model="person.role" />

            <span @click="removeParticipant(idx)" class="removeParticipant__button"> УДАЛИТЬ </span>
          </div>
        </div>
        <div class="personal__list__menu">
          <v-btn @click="updatePersonal" color="var(--accent)" text> Сохранить </v-btn>
        </div>
      </div>

      <message-container :errors="errors"></message-container>

      <v-btn class="closeButton" @click="closeControl" color="var(--message-error)"> Закрыть </v-btn>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { apiUrl } from '@/constants';
import { mapGetters } from 'vuex';
import MessageContainer from '@/components/ui-components/message-container.vue';
import DbPersonalList from '@/pages/seminars/seminarParticipants-control/db-personal-list.vue';

export default {
  name: 'seminar-participants-control',
  components: { DbPersonalList, MessageContainer },
  props: {
    seminar: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      dbPersonal: {
        jury: [],
        trainers: [],
        athletes: [],
      },

      editingPerson: null,
      personal: [],

      errors: [],
    };
  },
  computed: {
    ...mapGetters('authorization', {
      userData: 'getUserData',
    }),
  },
  methods: {
    async fetchPersonal() {
      await Promise.all(
        ['athletes', 'jury', 'trainers'].map(async (type) => {
          try {
            const response = await axios.get(`${apiUrl}/${type}`);
            if (response.status === 200) {
              this.dbPersonal[type] = response.data[type];
            }
          } catch (error) {
            if (error) {
              console.log(error?.data?.message);
            }
          }
        })
      );
    },
    getFilteredPersonalList(type) {
      return this.dbPersonal[type].filter((person) => this.personal.every((_person) => _person.code !== person._id));
    },
    editPerson(id) {
      if (id === this.editingPerson) {
        this.editingPerson = null;
        return;
      }
      this.editingPerson = id;
    },
    addDbPerson(person) {
      const roleInput = document.getElementById(person._id + '_role');
      const personName = person.fullname ? person.fullname : `${person.lastname ? person.lastname + ' ' : ''} ${person.name}`;

      const personObj = {
        code: person._id,
        role: roleInput.value,
        fullname: personName,
      };

      this.personal.push(personObj);
      roleInput.value = '';
    },
    addPerson() {
      const roleInput = document.getElementById('role'),
        nameInput = document.getElementById('name');

      const person = {
        code: '',
        role: roleInput.value,
        fullname: nameInput.value,
      };

      this.personal.push(person);
      roleInput.value = '';
      nameInput.value = '';
    },
    removeParticipant(idx) {
      this.personal.splice(idx, 1);
    },

    async updatePersonal() {
      try {
        const response = await axios.patch(
          `${apiUrl}/seminars/${this.seminar._id}/participants`,
          { participants: JSON.stringify(this.personal) },
          {
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${this.userData.token}`,
            },
          }
        );
        if (response.status === 200) {
          this.$emit('close-participants-control');
        }
      } catch (error) {
        if (error) {
          console.log(error?.response?.data);
          this.errors.push(error?.response?.data?.message);
        }
      }
    },

    closeControl() {
      this.$emit('close-participants-control');
    },
  },

  mounted() {
    this.fetchPersonal();
    this.personal = this.seminar.participants;
  },
};
</script>

<style scoped lang="scss">
.seminarsControl__wrapper {
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--background--card-secondary);
  border: 1px solid var(--border-container);

  .seminarParticipants__select__wrapper {
    flex: 1 1 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    overflow-y: auto;

    max-width: var(--desktop-small);
    width: 100%;
    margin: 5.25rem auto 1.25rem;

    .databasePersonal__wrapper {
      flex: 5 1 0;
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .addNewPerson__wrapper {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 0.5rem 1.25rem;
      padding: 0.5rem 1rem;

      background-color: var(--background--card);
      border-radius: 4px;

      .newPerson__control__wrapper {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.25rem 0.75rem;

        label {
          flex: 0 0 auto;
        }

        input {
          flex: 1 1 12ch;
          min-width: 0;
          margin-left: 0.5rem;
          padding: 3px 8px;
          background-color: var(--background--card-secondary);
          border-radius: 2px;

          &:focus-visible {
            background-color: var(--background--card-hover);
            outline: 1px solid var(--text-default);
          }
        }
      }

      .addPerson__button {
        align-self: center;
        height: 2rem;
        margin-left: auto;
      }
    }

    .personal__list__wrapper {
      flex: 4 1 0;
      display: flex;
      flex-direction: column;
      padding: 0.5rem 1rem;

      background-color: var(--background--card);
      border-radius: 4px;

      .personal__list__title {
        flex: 0 0 auto;
        padding: 0.5rem 0.5rem 0.75rem;
        font-size: 1.15rem;
      }

      .personal__list {
        flex: 1 1 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-y: auto;

        .personal__item__wrapper {
          position: relative;
          flex: 0 0 auto;
          padding: 0.25rem 0.5rem;
          border-radius: 2px;

          input {
            padding: 2px 8px;
          }

          .removeParticipant__button {
            display: none;
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            right: 0.5rem;

            color: var(--message-error);
            cursor: pointer;

            &:hover {
              font-weight: bold;
            }
          }

          &:hover {
            background-color: var(--background--card-hover);

            .removeParticipant__button {
              display: block;
            }
          }
        }
      }

      .personal__list__menu {
        flex: 0 0 auto;
        display: flex;
        justify-content: flex-end;
      }
    }

    .closeButton {
      position: absolute;
      top: 3.25rem;
      right: 1.25rem;
      height: 2.75rem;
      padding: 0 1rem !important;
      color: var(--text-default);
    }
  }
}
</style>
