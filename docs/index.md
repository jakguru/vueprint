---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "VuePrint"
  tagline: "A BluePrint for Vue 3 Projects providing much of the desired functionality in a consistent and easily configurable manner"
  image:
    src: /icon.jpg
    alt: VuePrint
  actions:
    - theme: brand
      text: What's Included
      link: /whats-included/
    - theme: brand
      text: Get Started
      link: /getting-started/
    - theme: alt
      text: View on GitHub
      link: https://github.com/jakguru/vueprint

features:
  - title: Global Event Bus
    details: An event bus which can be used to emit and subscribe to events from any component in any tab in the same browser
  - title: Identity and API Services
    details: A wrapper for axios which provides a built-in mechanism for handling bearer authentication and automatic refreshing of tokens
  - title: Push and Background Notifications
    details: Push Notification Management with hookups for Firebase Cloud Messaging Service Workers
  - title: UX and UI
    details: Includes the Vuetify Visual Framework, with additional utilities for more feedback
---

