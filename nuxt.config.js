import es from 'vuetify/lib/locale/es'

export default {
    // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
    ssr: false,

    server: {
        port : process.env.PORT || 3030,
        host : '0.0.0.0',
    },

    // Global page headers: https://go.nuxtjs.dev/config-head
    head: {
        title : 'MF App',
        meta  : [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: '' },
            { name: 'format-detection', content: 'telephone=no' },
        ],

        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        ],
    },

    // Global CSS: https://go.nuxtjs.dev/config-css
    css: [
        '@/assets/styles/styles.css',
    ],

    // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
    plugins: [
        '@/plugins/http-status',
        '@/plugins/rut',
        '@/plugins/alert',
    ],

    // Auto import components: https://go.nuxtjs.dev/config-components
    components: true,

    // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
    buildModules: [
    // https://go.nuxtjs.dev/eslint
        '@nuxtjs/eslint-module',
        // https://go.nuxtjs.dev/vuetify
        '@nuxtjs/vuetify',
    ],

    // Modules: https://go.nuxtjs.dev/config-modules
    modules: [
    // https://go.nuxtjs.dev/axios
        '@nuxtjs/axios',
        // https://go.nuxtjs.dev/pwa
        '@nuxtjs/pwa',
        '@nuxtjs/auth-next',
        '@nuxtjs/apollo',
    ],

    // Axios module configuration: https://go.nuxtjs.dev/config-axios
    axios: {},

    // PWA module configuration: https://go.nuxtjs.dev/pwa
    pwa: {
        icon: {
            source   : '@/static/logo.png',
            fileName : 'logo.png',
        },

        manifest: {
            name             : 'MF App',
            short_name       : 'MF App',
            lang             : 'es',
            display          : 'standalone',
            background_color : '#ECEFF1',
        },

        meta: {
            name                : 'MF App',
            theme_color         : '#003249',
            background_color    : '#ECEFF1',
            mobileAppIOS        : true,
            appleStatusBarStyle : 'black',
        },
    },

    // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
    vuetify: {
        customVariables : [ '~/assets/styles/vuetify/variables.scss' ],
        theme           : {
            themes: {
                light: {
                    primary: '#003249',
                },
            },
        },

        lang: {
            locales  : { es },
            current  : 'es',
            fallback : 'es',
        },
    },

    // Build Configuration: https://go.nuxtjs.dev/config-build
    build: {
    },

    srcDir: 'src/',

    router: {
        middleware: [ 'auth', 'pages' ],
        extendRoutes(routes, resolve) {

            routes.push( {
                name      : 'custom',
                path      : '*',
                component : resolve(__dirname, 'src/pages/login.vue'),
            } )

        },
    },

    auth: {
        redirect: {
            login    : '/login',
            logout   : '/login',
            callback : false,
            home     : '/after-login',
        },

        watchLoggedIn: true,

        strategies: {
            local: {
                scheme : 'refresh',
                token  : {
                    property : 'tokens.access.token',
                    required : true,
                    type     : 'Bearer',
                    maxAge   : 31556952,
                },

                refreshToken: {
                    property      : 'tokens.refresh.token',
                    data          : 'refreshToken',
                    required      : true,
                    tokenRequired : false,
                },

                user: {
                    property  : 'user',
                    autoFetch : true,
                },

                endpoints: {
                    login   : { url: '/auth/login', method: 'post' },
                    refresh : { url: '/auth/refresh-tokens', method: 'post' },
                    user    : { url: '/auth/user', method: 'get' },
                    logout  : { url: '/auth/logout', method: 'get' },
                },

                autoLogout: false,
            },
        },
    },

    publicRuntimeConfig: {
        axios: {
            baseURL: process.env.NUXT_ENV_API_HOST,
        },
    },

    privateRuntimeConfig: {
    },

    apollo: {
        clientConfigs: {
            default: '~/apollo/config.js',
        },

        authenticationType : '',
        tokenName          : 'auth._token.local',

        defaultOptions: {
            $query: {
                fetchPolicy: 'network-only',
            },
        },
    },
}
