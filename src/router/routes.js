//src/router/routes.js
import WelcomeLayout from "src/layouts/WelcomeLayout.vue";
import WelcomePage from "src/pages/WelcomePage.vue";

const routes = [
  {
    path: "/",
    component: () => import("layouts/HomeLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { name: "home", path: "", component: () => import("pages/HomeTab.vue") },
    ],
  },
  {
    path: "/insights",
    component: () => import("layouts/InsightsLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "insights",
        path: "",
        component: () => import("pages/InsightsTab.vue"),
      },
    ],
  },
  {
    path: "/insights/needs",
    component: () => import("layouts/NeedsPageLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "needs",
        path: "",
        component: () => import("pages/NeedsChartPage.vue"),
      },
    ],
  },
  {
    path: "/insights/needs/:needSlug",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { name: "need", path: "", component: () => import("pages/NeedPage.vue") },
    ],
  },
  {
    path: "/settings",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    // props: { title: "Settings" },
    meta: { requiresAuth: true },
    children: [
      {
        name: "settings",
        path: "",
        component: () => import("pages/SettingsPage.vue"),
      },
      {
        path: "notifications",
        component: () => import("pages/settings/NotificationsPage.vue"),
      },
    ],
  },
  {
    path: "/welcome",
    component: WelcomeLayout,
    children: [{ path: "", component: WelcomePage }],
  },
  {
    path: "/onboarding",
    component: () => import("layouts/WelcomeLayout.vue"),
    children: [
      {
        path: "1",
        component: () => import("pages/onboarding/ValuePropositionPage.vue"),
      },
    ],
  },
  {
    path: "/onboarding",
    component: () => import("layouts/GoBackTitleLayout.vue"),
    children: [
      {
        name: "PrivacyFirstPage",
        path: "2",
        component: () => import("pages/onboarding/PrivacyFirstPage.vue"),
      },
      {
        path: "3",
        component: () => import("pages/onboarding/UserIntentionsPage.vue"),
      }, //TODO:6 add skip button
      {
        path: "4",
        component: () =>
          import("pages/onboarding/OnboardingNotificationsPage.vue"),
      },
    ],
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
        component: () => import("pages/settings/PrivacyPolicyPage.vue"),
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
        component: () => import("pages/settings/TermsConditionsPage.vue"),
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
        component: () => import("pages/settings/ContactUsPage.vue"),
      },
    ],
  },
  {
    path: "/account-deletion",
    meta: { requiresAuth: true },
    component: () => import("layouts/GoBackTitleLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/settings/AccountDeletionPage.vue"),
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
