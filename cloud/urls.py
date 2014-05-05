from django.conf.urls import patterns, include, url
from django.shortcuts import HttpResponseRedirect
import main.views

# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # url(r'^admin/', include(admin.site.urls)),
    url(r'^$', lambda x: HttpResponseRedirect('/main/')),
    url(r'^social/', include('social_auth.urls')),
    url(r'^login_error/', "main.views.login_error"),
    url(r'login/', main.views.log_in),
    url(r'logout/', main.views.log_out),
    url(r'change_password/', main.views.change_password),
    url(r'^main/', include('main.urls'))
)