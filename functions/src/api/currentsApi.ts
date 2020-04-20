import { errorResponse, successResponse } from '../utils';
import axios, { AxiosResponse } from 'axios';
import { firestore } from 'firebase-admin';
const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const api = express();
axios.defaults.baseURL = 'https://api.currentsapi.services/v1';
axios.defaults.headers.common['Authorization'] = `${functions.config().currents.key}`;

api.use(cors({ origin: true }));
api.get(
    '/latest-news',
    async (request: any, response: any) => {
        try {
            const batch = firestore().batch();
            axios.get(`/latest-news`).then(async (value: AxiosResponse) => {
                const newsTypes = await firestore().collection("newsType").get();
                console.log('newsTypes', newsTypes);
                value.data.news.forEach((news: any) => {
                    const docRef = firestore()
                        .collection("news")
                        .doc(news.id);
                    const categories = newsTypes.docs
                        .filter((category) => news.category.includes(category.data().description))
                        .map((category) => category.ref);
                    batch.set(docRef, {
                        title: news.title,
                        description: news.description,
                        image: news.image === "None" ? null : news.image,
                        url: news.url,
                        author: news.author,
                        categories,
                        published: news.published
                    });
                });
                batch.commit()
                    .then((result: firestore.WriteResult[]) => {
                        response.send(successResponse({ version: 1, newsLength: result.length }));
                    })
                    .catch((error: Error) => {
                        response.send(errorResponse(error.message));
                    });
                return response.send(successResponse({ version: 1, data: value.data }));
            }).catch((error: any) => {
                console.log('error from api current -> ', error.message);
                return response.send(errorResponse(error.message));
            });

        } catch (error) {
            return response.send(errorResponse(error.message));
        }
    }
);

api.get(
    '/categories',
    async (request: any, response: any) => {
        try {
            const batch = firestore().batch();
            axios.get('/available/categories').then((value: AxiosResponse) => {
                value.data.categories.forEach((category: any) => {
                    const docRef = firestore()
                        .collection("newsType")
                        .doc();
                    batch.set(docRef, { description: category });
                });
                batch.commit()
                    .then((result: firestore.WriteResult[]) => {
                        response.send(successResponse({ version: 1, result }));
                    })
                    .catch((error: Error) => {
                        response.send(errorResponse(error.message));
                    });
            }).catch((error: any) => {
                return response.send(errorResponse(error.message));
            });

        } catch (error) {
            return response.send(errorResponse(error.message));
        }
    }
);

export default api;