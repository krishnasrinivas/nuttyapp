/*
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package main

import (
	"encoding/json"
	"flag"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/stretchr/goweb"
	"github.com/stretchr/goweb/context"
	ghttp "github.com/stretchr/goweb/http"
)

func nuttyPut(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	tindex := c.PathValue("tindex")

	log.Println("PUT ", sessionid, " ", tindex)

	data, dataErr := c.RequestBody()
	if dataErr != nil {
		log.Println(dataErr)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, dataErr.Error())
	}
	dataErr = os.MkdirAll(basedir+sessionid, 0700)
	if dataErr != nil {
		log.Println(dataErr)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, "Unable to create directory")
	}
	dataErr = ioutil.WriteFile(basedir+sessionid+"/"+tindex, data, 0600)
	if dataErr != nil {
		log.Println(dataErr)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, "Unable to WriteFile")
	}
	rjsonBytes, err := json.Marshal(struct {
		tindex string `json:"end"`
	}{
		tindex: tindex,
	})
	if err != nil {
		log.Fatalln(err)
	}
	dataErr = ioutil.WriteFile(basedir+sessionid+"/rec.json", rjsonBytes, 0600)
	if dataErr != nil {
		log.Println(dataErr)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, "Unable to WriteFile")
	}
	return goweb.API.Respond(c, 200, nil, nil)
}

func nuttyGet(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	tindex := c.PathValue("tindex")

	log.Println("GET ", sessionid, " ", tindex)

	bs, err := ioutil.ReadFile(basedir + sessionid + "/" + tindex)
	if err != nil {
		log.Println(err)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, "Unable to ReadFile")
	}
	return goweb.Respond.With(c, 200, bs)
}

func nuttyGetLength(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	bs, err := ioutil.ReadFile(basedir + sessionid + "/rec.json")
	if err != nil {
		log.Println(err)
		return goweb.API.RespondWithError(c, http.StatusInternalServerError, "Unable to ReadFile")
	}
	return goweb.Respond.With(c, 200, bs)
}

// get current working directory
var currentWorkingDirectory string

func init() {
	var err error
	currentWorkingDirectory, err = os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}
}

var (
	basedir string
	address string
)

func main() {
	flag.StringVar(&basedir, "basedir", currentWorkingDirectory, "basedir")
	flag.StringVar(&address, "address", ":9090", "address")
	flag.Parse()

	basedir = basedir + "/"
	goweb.Map(ghttp.MethodPut, "/recording/{sessionid}/{tindex}", nuttyPut)
	goweb.Map(ghttp.MethodGet, "/recording/{sessionid}/rec.json", nuttyGetLength)
	goweb.Map(ghttp.MethodGet, "/recording/{sessionid}/{tindex}", nuttyGet)
	goweb.MapBefore(func(c context.Context) error {
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Origin", "*")
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Methods", "PUT,GET")
		c.HttpResponseWriter().Header().Set("Content-Type", "application/json")
		return nil
	})

	s := &http.Server{
		Addr:           address,
		Handler:        goweb.DefaultHttpHandler(),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	log.Println("Starting server")
	log.Fatal(s.ListenAndServe())
}
