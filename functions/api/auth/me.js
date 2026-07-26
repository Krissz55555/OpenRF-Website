import { authJson, currentUser } from './_shared.js';
export async function onRequestGet(context) {
  const user = await currentUser(context);
  return authJson({ok:true,authenticated:!!user,user});
}
