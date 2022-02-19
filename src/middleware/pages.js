function findViewByName(views, name) {

    if (!views)
        return false

    for (const view of views) {

        if (view.name === name) {

            return true

        }
        else if (view.children) {

            const result = findViewByName(view.children, name)

            if (result)
                return true

        }

    }

    return false

}

function hasUserAccessToPage(page, user) {

    return findViewByName(user.views, page)

}

function findListItem(name, items) {

    for (const item of items) {

        if (item.name === name) {

            return item

        }
        else if (item.children) {

            const found = findListItem(name, item.children)

            if (found)
                return found

        }

    }

    return null

}

export default function(context) {

    if (!context.$auth.loggedIn)
        return

    if (hasUserAccessToPage(context.route.name, context.$auth.user) ) {

        const page = findListItem(context.route.name, context.$auth.user.views)
        context.app.store.commit('navbar/setProp', {
            title : page.label,
            name  : page.name,
        } )

        return

    }

    context.app.router.push( { name: context.$auth.user.role.initialView } )

}
