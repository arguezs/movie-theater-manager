<template>
  <v-chip
    :to="{
      name: 'Transaction',
      params: {sessionId: session.id} }"
    :color="afterMidnight ? 'accent' : ''"
    :dark="afterMidnight"
    :disabled="disabled">
    {{timeString}}
  </v-chip>
</template>

<script>
export default {
  props: { session: Object },
  computed: {
    timeString () {
      return this.session.time.substring(0, 5)
    },
    afterMidnight () {
      return this.session.time.substring(0, 2) == '00'
    },
    disabled () {
      const date = new Date(this.session.date + ' ' + this.session.time)
      return date.getTime() < Date.now()
    }
  }
}
</script>