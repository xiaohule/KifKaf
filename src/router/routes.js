import GoBackTitleLayout from "layouts/GoBackTitleLayout.vue";

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
    component: GoBackTitleLayout,
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
    component: GoBackTitleLayout,
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
    component: GoBackTitleLayout,
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
    component: GoBackTitleLayout,
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
    component: GoBackTitleLayout,
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
    component: GoBackTitleLayout,
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
