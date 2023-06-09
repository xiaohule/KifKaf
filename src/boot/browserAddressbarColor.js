import { AddressbarColor } from "quasar";
//What this does is that it injects some <meta> tags into your index.html at runtime.
// Because the meta tag doesn’t get injected until run time you can dynamically change this color multiple times, based on the page the user is on (by calling the set method in the created() lifecycle hook on the respective pages):
export default () => {
  AddressbarColor.set("#f7f7f7");
};
