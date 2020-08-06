# Grails 4 React application with spring-security-rest example

[Documentation for Grails 4](http://docs.grails.org/latest/)

[Documentation for spring-security-core](https://grails-plugins.github.io/grails-spring-security-core/latest/)

[Documentation for spring-security-rest](http://alvarosanchez.github.io/grails-spring-security-rest/latest/docs/)

To start the server:
`./gradlew server:bootRun`

To start the client:
`./gradlew client:start`

-----

# Steps to build your own

1. Create a grails 4 project with React profile
`grails create-app demo --profile=react`

2. Add dependencies to `server/build.gradle`:
```
compile 'org.grails.plugins:spring-security-core:4.0.2'
compile 'org.grails.plugins:spring-security-rest:3.0.1'
compile 'org.grails.plugins:spring-security-rest-gorm:3.0.1'
```

3. `cd server`, run `grails compile` to install the dependencies

4. Run `grails s2-quickstart demo User Role` to generate the following:
  - grails-app/domain/demo/User
  - grails-app/domain/demo/Role
  - grails-app/domain/demo/UserRole
  - src/main/groovy/demo/UserPasswordEncoderListener.groovy (to handle password encoding)
  - grails-app/conf/spring/resources.groovy
  - grails-app/conf/application.groovy

5. In `application.groovy`, replace the generated chainMap to below:
```
grails.plugin.springsecurity.filterChain.chainMap = [
    //Stateless chain
    [
        pattern: '/**',
        filters: 'JOINED_FILTERS,-anonymousAuthenticationFilter,-exceptionTranslationFilter,-authenticationProcessingFilter,-securityContextPersistenceFilter,-rememberMeAuthenticationFilter'
    ],

    //Traditional, stateful chain
    [
        pattern: '/stateful/**',
        filters: 'JOINED_FILTERS,-restTokenValidationFilter,-restExceptionTranslationFilter'
    ]
]
```

6. Since we are using gorm for token storage, we need to create a token domain class that looks like this, you can create it in `grails-app/domain/demo` or by running `grails create-domain-class AuthenticationToken`:
```
package demo

class AuthenticationToken {

    String tokenValue
    String username

    static mapping = {
        version false
    }
}
```

7. Add the location of the token domain class to `application.groovy`
`grails.plugin.springsecurity.rest.token.storage.gorm.tokenDomainClassName = 'demo.AuthenticationToken'`

8. Create a domain class for testing `grails create-domain-class Animals`, it should look something like this:
```
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
```
`@Secured(['ROLE_ADMIN'])` will only be accessible to users with authority `ROLE_ADMIN`
`@Resource(uri = '/api/animal')` will expose the the api

9. Create a dummy user in `init/demo/Bootstrap.groovy` with `ROLE_ADMIN` and some data in the `Animal` class
```
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
```

10. Start the server `./gradlew server:bootRun`

Side note: `.gradle` should be in the `.gitignore` but the generated file does not target the folder correctly. To fix this, create another `.gitignore` at the root level and remove `.gradle` from `server/.getignore`.

-----

# Testing your REST API

1. Run `curl -i 0:8080/api/animal` in the terminal, we see that we are not authorized.

```
HTTP/1.1 401 
WWW-Authenticate: Bearer
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Mon, 27 Jul 2020 15:22:10 GMT

{"timestamp":1595863330038,"status":401,"error":"Unauthorized","message":"No message available","path":"/api/animal"}
```

2. Try logging in with the `username` and `password` we created earlier.

`curl -i -H "Content-Type: application/json" --data '{"username":"me","password":"password"}' 0:8080/api/login`

We should see an access-token is returned, this is what we need to provide to our server in order to authenticate our request.

```
HTTP/1.1 200 
Cache-Control: no-store
Pragma: no-cache
Content-Type: application/json;charset=UTF-8
Content-Length: 112
Date: Mon, 27 Jul 2020 15:23:17 GMT

{"username":"me","roles":["ROLE_ADMIN"],"token_type":"Bearer","access_token":"pnfj96jfgmoc8qhob34ibis61tjqndn7"
```

3. With the access-token, set it to the `Authorization` header and try making the request again.
```
curl -i -H "Authorization: Bearer pnfj96jfgmoc8qhob34ibis61tjqndn7" 0:8080/api/animal
```

We can now access the data from `api/animal`.

```
HTTP/1.1 200 
Content-Type: application/json;charset=UTF-8
Transfer-Encoding: chunked
Date: Mon, 27 Jul 2020 15:30:36 GMT

[{"id":1,"species":"Dog"},{"id":2,"species":"Fox"},{"id":3,"species":"Alpaca"}]
```
