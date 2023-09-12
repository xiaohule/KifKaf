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
    children: [{ path: "", component: () => import("pages/LearnTabV1.vue") }],
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
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("pages/SettingsPage.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("layouts/AuthLayout.vue"),
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },
  //TODO:1 make only one layout for terms and privacy policy and auth that can take a title as param
  {
    path: "/privacy-policy",
    component: () => import("layouts/PrivacyPolicyLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/PrivacyPolicyPage.vue"),
      },
    ],
  },
  {
    path: "/terms",
    component: () => import("layouts/TermsLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/TermsConditionsPage.vue"),
      },
    ],
  },
  {
    path: "/contact",
    component: () => import("layouts/ContactLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/ContactUsPage.vue"),
      },
    ],
  },

  // {
  //   path: "/register",
  //   component: () => import("layouts/AuthLayout.vue"),
  //   children: [{ path: "", component: () => import("pages/RegisterPage.vue") }],
  // },
  // Always leave this as last one, but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
