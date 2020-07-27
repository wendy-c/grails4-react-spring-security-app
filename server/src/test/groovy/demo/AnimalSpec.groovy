package demo

import grails.testing.gorm.DomainUnitTest
import spock.lang.Specification

class AnimalsSpec extends Specification implements DomainUnitTest<Animals> {

    def setup() {
    }

    def cleanup() {
    }

    void "test something"() {
        expect:"fix me"
            true == false
    }
}
