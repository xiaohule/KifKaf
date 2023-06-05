const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/HomeTab.vue") }],
  },
  {
    path: "/learn",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/LearnTab.vue") }],
  },
  {
    path: "/timeline",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/TimelineTab.vue") }],
  },
  {
    path: "/search",
    component: () => import("layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/SearchTab.vue") }],
  },
  {
    path: "/settings",
    component: () => import("layouts/SettingsLayout.vue"),
    // meta: { requiresAuth: true, transition: "slide-right" },
    meta: { requiresAuth: true },
    children: [{ path: "", component: () => import("pages/SettingsPage.vue") }],
  },
  {
    path: "/login",
    component: () => import("layouts/AuthLayout.vue"),
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },
  {
    path: "/register",
    //TODO: not used?
    component: () => import("layouts/AuthLayout.vue"),
    children: [{ path: "", component: () => import("pages/RegisterPage.vue") }],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
