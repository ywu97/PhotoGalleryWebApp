import tempfile

# Cloud-safe of uuid, so that many cloned servers do not all use the same uuids.
from gluon.utils import web2py_uuid

import urllib


# Here go your api methods.
@auth.requires_login()
@auth.requires_signature()
def add_url():
    print "add url controller handle"
    if request.post_vars.url is None:
        redirect(URL('default', 'index'))
    else:
        url = urllib.unquote(request.post_vars.url)
        print "url in post vars", url
        db.user_images.insert(image_url=url)
        redirect(URL('default', 'index'))


@auth.requires_login()
@auth.requires_signature()
def get_users():
    all_users = []
    for row in db(db.auth_user.id > 0).select():
        print row
        print row.first_name, row.last_name
        all_users.append(dict(first_name=row.first_name, last_name=row.last_name, id=row.id))
    return response.json(all_users)


@auth.requires_login()
@auth.requires_signature()
def get_current_user():
    return response.json(auth.user)


@auth.requires_login()
@auth.requires_signature()
def get_user_images():
    id = request.post_vars.id
    all_user_images = []
    user = db(db.auth_user.id == int(id)).select().first()
    for row in db(db.user_images.created_by == user).select():
        print row
        print row.image_url
        all_user_images.append(row.image_url)
    return response.json(all_user_images)
