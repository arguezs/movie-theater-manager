<template>

  <form-layout
    max-width="30rem"
    :alert="result"
    succes-msg="Contraseña restaurada"
    fail-msg="Error al cambiar la contraseña"
    form-title="Reestablecer contraseña"
    :disabled="requiredPass"
    :loading="loadingState"
    submit-text="Restaurar"
    @submit="restorePassword">
    <span slot="subtitle">Introduce una nueva contraseña para tu cuenta</span>

    <v-text-field label="Nueva contraseña" type="password" v-model="password" />
    <v-text-field label="Repetir contraseña" type="password" v-model="repeatPass" />  
  </form-layout>

</template>

<script>
import UserService from '@/services/UserService'
import FormLayout from '@/components/FormLayout'
import {required, sameAs, helpers} from 'vuelidate/lib/validators'
const passRegEx = helpers.regex('passRegEx', /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)

export default {
  components: { FormLayout },
  data () {
    return {
      password: null,
      repeatPass: null,
      loadingState: false,
      result: null
    }
  },
  validations: {
    password: {required, passRegEx},
    repeatPass: {sameAsPassword: sameAs('password')}
  },
  computed: {
    requiredPass () {
      return !this.password || !this.repeatPass
    }
  },
  methods: {
    restorePassword () {
      this.loadingState = true
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.result = { invalid: true, message: [] }

        if (!this.$v.password.passRegEx)
          this.result.message.push("La contraseña debe contener al menos una letra, un número y un símbol especial, y tener al menos ocho carácteres de longitud")
        if (!this.$v.repeatPass.sameAsPassword)
          this.result.message.push('Las contraseñas no coinciden')

        this.loadingState = false
      } else {
        const vue = this

        UserService.restorePassword({password: this.password, code: this.$route.params.recoveryCode})
          .then(result => {
            if (result.data){
              vue.result = {success: true}
              vue.password = null
              vue.repeatPass = null
            }
          })
          .catch(() => { vue.result = {error: true} })
          .finally(() => { vue.loadingState = false })
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    const code = to.params.recoveryCode
    console.log(to)

    UserService.checkCode(code)
      .then(result => {
        if (!result.data)
          next({name: 'Error page', params: {errorCode: 404}})
        else
          next()
      })
      .catch(() => { next({name: 'Error page', params: {errorCode: 500}}) })
  }
}
</script>

<style>

</style>