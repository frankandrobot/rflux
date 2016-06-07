import {Observable} from 'kefir'


export function isObservable(obj) {

  return obj && obj instanceof Observable
}
