package demo

import grails.gorm.transactions.Transactional

class BootStrap {
    def init = {
        addTestUser()
        new Animal(species: 'Dog').save()
        new Animal(species: 'Fox').save()
        new Animal(species: 'Alpaca').save()
    }

    @Transactional
    void addTestUser() {
        def adminRole = new Role(authority: 'ROLE_ADMIN').save()

        def testUser = new User(username: 'me', password: 'password').save()

        UserRole.create testUser, adminRole

        UserRole.withSession {
            it.flush()
            it.clear()
        }

        assert User.count() == 1
        assert Role.count() == 1
        assert UserRole.count() == 1
    }
}