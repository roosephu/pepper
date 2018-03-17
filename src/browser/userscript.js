// ==UserScript==
// @name         Send to Pepper
// @namespace    https://github.com/roosephu/pepper
// @version      0.1
// @description  Tampermonkey plugin for Pepper
// @author       roosephu
// @match        https://arxiv.org/*
// @grant        none
// @require      https://code.jquery.com/jquery-latest.min.js
// ==/UserScript==

(function () {
  'use strict'

  function click () {
    $.ajax({
      url: 'http://localhost:9999',
      success (result) {
      }
    })

    $.post(`http://localhost:9999/add/${encodeURIComponent(window.location.href)}`, (result) => {
      console.log({ result })
    })
  }

  const button = $('<button />')
    .text('Add to Pepper')
    .attr('type', 'button')
    .attr('style', 'position: fixed; right: 20px; bottom: 20px;')
    .click(click)

  $('body').append(button)
})()
