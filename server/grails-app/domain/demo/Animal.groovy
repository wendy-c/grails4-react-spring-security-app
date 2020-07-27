package demo

import grails.plugin.springsecurity.annotation.Secured
import grails.rest.Resource
import groovy.transform.CompileStatic

@CompileStatic
@Secured(['ROLE_ADMIN'])
@Resource(uri = '/api/animal')
class Animal {

    String species

    static constraints = {
    }
}
