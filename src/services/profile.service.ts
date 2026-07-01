import { Services } from './service-registry'

export const getCurrentProfile: typeof Services.profile.getCurrentProfile = (...args) =>
  Services.profile.getCurrentProfile(...args)

export const updateCurrentProfile: typeof Services.profile.updateCurrentProfile = (...args) =>
  Services.profile.updateCurrentProfile(...args)
