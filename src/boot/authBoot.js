import { boot } from "quasar/wrappers";
import { getCurrentUser } from "vuefire";

export default boot(({ router }) => {
  router.beforeEach(async (to) => {
    // routes with `meta: { requiresAuth: true }` will check for the users, others won't
    if (to.meta.requiresAuth) {
      const currentUser = await getCurrentUser();
      // if the user is not logged in, redirect to the login page
      if (!currentUser) {
        return {
          path: "/login",
          query: {
            // we keep the current path in the query so we can redirect to it after login
            // with `router.push(route.query.redirect || '/')`
            redirect: to.fullPath,
          },
        };
      }
    }
  });

  // app.use(router); //handled by quasar
});
