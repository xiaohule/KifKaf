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
  // {
  //   path: "/timeline",
  //   component: () => import("layouts/MainLayout.vue"),
  //   meta: { requiresAuth: true },
  //   children: [{ path: "", component: () => import("pages/TimelineTab.vue") }],
  // },
  // {
  //   path: "/search",
  //   component: () => import("layouts/MainLayout.vue"),
  //   meta: { requiresAuth: true },
  //   children: [{ path: "", component: () => import("pages/SearchTab.vue") }],
  // },
  {
    path: "/settings",
    component: () => import("layouts/goBackTitleLayout.vue"),
    props: { title: "Settings" },
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        component: () => import("pages/SettingsPage.vue"),
      },
    ],
  },
  {
    path: "/welcome",
    component: () => import("layouts/WelcomeLayout.vue"),
    children: [{ path: "", component: () => import("pages/WelcomePage.vue") }],
  },
  {
    path: "/login",
    component: () => import("layouts/goBackTitleLayout.vue"),
    children: [
      { path: "", component: () => import("pages/login/LoginPage.vue") },
      {
        path: "email",
        component: () => import("pages/login/EmailLogin.vue"),
      },
    ],
  },
  //TODO:1 make only one layout for terms and privacy policy and auth that can take a title as param
  {
    path: "/privacy-policy",
    component: () => import("layouts/goBackTitleLayout.vue"),
    props: { title: "Privacy Policy" },
    children: [
      {
        path: "",
        component: () => import("pages/PrivacyPolicyPage.vue"),
      },
    ],
  },
  {
    path: "/terms",
    component: () => import("layouts/goBackTitleLayout.vue"),
    props: { title: "Terms of Service" },
    children: [
      {
        path: "",
        component: () => import("pages/TermsConditionsPage.vue"),
      },
    ],
  },
  {
    path: "/contact",
    component: () => import("layouts/goBackTitleLayout.vue"),
    props: { title: "Contact Us" },
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
