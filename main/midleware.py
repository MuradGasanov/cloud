# -*- coding: utf-8 -*-

__author__ = 'Murad Gasanov'

from django.shortcuts import render_to_response
from django.http import HttpResponseForbidden


class MiddleWareProcess(object):

    @staticmethod
    def process_request(request):
        if not request.path.startswith('/login') and \
                not request.user.is_authenticated():
            return render_to_response('login.html')