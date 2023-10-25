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
    path: "/settings",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    // props: { title: "Settings" },
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
    // component: () => import("layouts/GoBackTitleLayout.vue"),
    component: () => import("layouts/GoBackTitleLayout.vue"),
    children: [
      { path: "", component: () => import("pages/login/LoginPage.vue") },
      {
        path: "email",
        component: () => import("pages/login/EmailLogin.vue"),
      },
    ],
  },
  {
    path: "/privacy-policy",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    // props: { title: "Privacy Policy" },
    children: [
      {
        path: "",
        component: () => import("pages/PrivacyPolicyPage.vue"),
      },
    ],
  },
  {
    path: "/terms",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    // props: { title: "Terms of Service" },
    children: [
      {
        path: "",
        component: () => import("pages/TermsConditionsPage.vue"),
      },
    ],
  },
  {
    path: "/contact",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    // props: { title: "Contact Us" },
    children: [
      {
        path: "",
        component: () => import("pages/ContactUsPage.vue"),
      },
    ],
  },
  {
    path: "/account-deletion",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/AccountDeletionPage.vue"),
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
