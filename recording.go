/*
 * https://nutty.io
 * Copyright (c) 2014 krishna.srinivas@gmail.com All rights reserved.
 * GPLv3 License <http://www.gnu.org/licenses/gpl.txt>
 */

package main

import (
	"github.com/stretchr/goweb"
	"github.com/stretchr/goweb/context"
	ghttp "github.com/stretchr/goweb/http"
	"net"
	"net/http"
	"time"
	"log"
	"os"
	"io/ioutil"
        "flag"
)

const (
	Address string = ":9090"
)

var basedir string

func nuttyput(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	tindex := c.PathValue("tindex")
	log.Print("PUT ", sessionid, " ", tindex);
    data, dataErr := c.RequestBody()
    if dataErr != nil {
    	log.Print(dataErr)
        return goweb.API.RespondWithError(c, http.StatusInternalServerError, dataErr.Error())
    }
    dataErr = os.Mkdir(basedir + sessionid, 0700)
    if (dataErr != nil && !os.IsExist(dataErr)) {
    	log.Print(dataErr)
    	return goweb.API.RespondWithError (c, http.StatusInternalServerError, "Unable to create directory")
    }
    dataErr = ioutil.WriteFile(basedir + sessionid + "/" + tindex, data, 0600)
    if (dataErr != nil) {
    	log.Print(dataErr)
    	return goweb.API.RespondWithError (c, http.StatusInternalServerError, "Unable to WriteFile")
    }
    var recjson string
    recjson = "{\"end\":" + string(tindex) + "}"
    dataErr = ioutil.WriteFile(basedir + sessionid + "/rec.json", []byte(recjson), 0600)
    if (dataErr != nil) {
    	log.Print(dataErr)
    	return goweb.API.RespondWithError (c, http.StatusInternalServerError, "Unable to WriteFile")
    }
    return goweb.API.Respond(c, 200, nil, nil)
}

func nuttyget(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	tindex := c.PathValue("tindex")
	log.Print("GET ", sessionid, " ", tindex);
	bs, err := ioutil.ReadFile(basedir + sessionid + "/" + tindex)
	if (err != nil) {
		log.Print(err)
		return goweb.API.RespondWithError (c, http.StatusInternalServerError, "Unable to ReadFile")
	}
	return goweb.Respond.With(c, 200, bs)
}

func nuttygetlength(c context.Context) error {
	sessionid := c.PathValue("sessionid")
	bs, err := ioutil.ReadFile(basedir + sessionid + "/rec.json")
	if (err != nil) {
		log.Print(err)
		return goweb.API.RespondWithError (c, http.StatusInternalServerError, "Unable to ReadFile")
	}
	return goweb.Respond.With(c, 200, bs)
}

func main() {
	flag.StringVar(&basedir, "basedir", "./", "basedir")
	flag.Parse()
	basedir = basedir + "/"
	goweb.Map(ghttp.MethodPut, "/recording/{sessionid}/{tindex}", nuttyput)
	goweb.Map(ghttp.MethodGet, "/recording/{sessionid}/rec.json", nuttygetlength)
	goweb.Map(ghttp.MethodGet, "/recording/{sessionid}/{tindex}", nuttyget)
	goweb.MapBefore(func (c context.Context) error {
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Origin", "*")
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.HttpResponseWriter().Header().Set("Access-Control-Allow-Methods", "PUT,GET")
		c.HttpResponseWriter().Header().Set("Content-Type", "application/json")
		return nil
	});
	s := &http.Server{
		Addr:           Address,
		Handler:        goweb.DefaultHttpHandler(),
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}
	listener, listenErr := net.Listen("tcp", Address)
	if (listenErr != nil) {
		log.Print("listenErr! : ", listenErr)
	}
	log.Print("starting server")
	s.Serve(listener)
}
