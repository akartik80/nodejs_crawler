# nodejs_crawler

A recursive web crawler to crawl a website and harvest all possible hyperlinks that belong
to that website. All routes are stored in postgreSQL database with number of times they are
referenced with different set of parameters. All the different parameter keys are also stored.
A redis set is used to avoid crawling same URL multiple times.

### Prerequisites

```
nodejs
npm
postgreSQL
redis
```

#### Setup

1. Install the latest version of node and npm.

2. Please note that these commands are for linux only. For other operating systems, follow
installation guides on postgreSQL and redis websites.


####postgreSQL
```
sudo apt-get install postgresql (skip if already installed)
sudo service postgresql start
sudo su postgres
psql (login to psql shell)

Run following commands on postgres shell

postgres=# create database nodejs_crawler;
postgres=# create user your_user with createuser password your_pass; (skip this if you want to use already created superuser)
postgres=# grant all privileges on database nodejs_crawler to your_user;
postgres=# \q (exit from postgres shell)

exit (exit from postgres user)
psql -h localhost -U your_user -d nodejs_crawler; (login to nodejs_crawler db)

nodejs_crawler=# create extension hstore;
nodejs_crawler=# create table crawl_data(path text primary key, host text, params hstore, reference_count integer);
nodejs_crawler=# \q (exit from nodejs_crawler)

```

####Redis

```
sudo apt install redis-server
run redis-cli to verify redis installation
```

####Install dependencies

From the root of the project, run:

```
npm i
```

This will automatically install all dependencies required for this application.

###Configuration

This application needs a config.js file in its root directory. Run following commands from
root directory of application.

```
cp config.template config.js
vi config.js
```

You can edit application level configurations in this file. To see less or more output,
you can edit winston logger level as:

```
winston: {
  level: 'level'
},
```

For full list of logging levels, see: https://github.com/winstonjs/winston#logging-levels.

IMPORTANT: You should also specify postgres and redis connection details in respective keys
or else the connections will not be established.

This application by default makes at most 5 web requests in parallel. If you wish to change
that, change config.js as:

```
application: {
  parallelRequestLimit: 10
}
```


### Usage

If you want to crawl a website. For example say https://medium.com, first go to config.js
and edit matcher and top level domain regex in key application as:

```
application: {
  parallelRequestLimit: 5,
  matcherRegex: /medium\.com/g,
  tld: {
    match: /\.com\/($|\?)/,
    find: /\.com\//,
    replace: '.com'
  }
}
```

If you want to crawl http://example.io/, the config would be:

```
application: {
  parallelRequestLimit: 5,
  matcherRegex: /example\.io/g,
  tld: {
    match: /\.io\/($|\?)/,
    find: /\.io\//,
    replace: '.io'
  }
}
```

This application stores its logs in log/application.log. I have'nt checked in that file to
git. So you'd have to make it first. From the root of application, run:

```
mkdir log
touch log/application.log
```

After this, go to application root and run npm start 'https://medium.com' (the website you
want to crawl). Just remember to change the config file accordingly to your website.


### Application Logs

This application stores its logs in log/application.log. If you want logs on stdout, just
run node index.js from the root of application.

To see application logs, run from root of application: 

```
tailf -n 100 log/application.log
```

### Final output

To see the final results of crawling (or at any time to see current crawling results),
open up postgres:

```
psql -h localhost -U your_user -d nodejs_crawler; (login to nodejs_crawler db)
```

To see all pages ordered by reference_count:
```
nodejs_crawler=# select path, host, reference_count, akeys(params) as params from crawl_data order by reference_count desc;
``` 

You can also open up redis set 'visitedUrls' to see set of all visited URLs (can be seen from
postgres also). 


## Author

* **Kartik Arora** - *All work* - [akartik80](https://github.com/akartik80)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/akartik80/nodejs_crawler/blob/master/LICENSE) file for details

## Acknowledgments

* I would like to thank [Rentomojo](https://www.rentomojo.com/) for inspiring me for this project.
